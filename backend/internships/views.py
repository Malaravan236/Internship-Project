from django.db import IntegrityError
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.models import Internship, Application, Feedback, Certificate, AdminNotification
from .serializers import (
    InternshipSerializer,
    ApplicationSerializer,
    FeedbackCreateSerializer,
    CertificateSerializer,
    ApplicationStatusSerializer,
    AdminNotificationSerializer,   # ✅ make sure this exists in serializers.py
)
from .services.certificate_service import attach_pdf_to_certificate


class InternshipViewSet(viewsets.ModelViewSet):
    queryset = Internship.objects.all().order_by("-created_at")
    serializer_class = InternshipSerializer
    permission_classes = [permissions.AllowAny]

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by("-applied_at")  # ✅ FIXED
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        try:
            serializer.save(student=request.user)
        except IntegrityError:
            return Response(
                {"detail": "You already applied for this internship."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)



# ✅ Student submits feedback ONLY when status == completed
class FeedbackCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = FeedbackCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        app_id = ser.validated_data["application_id"]
        application = get_object_or_404(Application, id=app_id)

        # Only owner student
        if application.student_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        # Must be completed
        if application.status != "completed":
            return Response({"detail": "Internship not completed yet."}, status=status.HTTP_400_BAD_REQUEST)

        # Only one feedback
        if hasattr(application, "feedback"):
            return Response({"detail": "Feedback already submitted."}, status=status.HTTP_400_BAD_REQUEST)

        feedback = Feedback.objects.create(
            application=application,
            rating=ser.validated_data["rating"],
            comment=ser.validated_data.get("comment", ""),
            created_by=request.user,
        )

        # Create certificate if not exists
        cert, _ = Certificate.objects.get_or_create(
            application=application,
            defaults={"certificate_no": f"CERT-{application.id}-{request.user.id}"}
        )

        # Auto-generate PDF file if missing
        if not cert.pdf:
            student_name = application.full_name or request.user.username
            internship_title = application.internship.title
            attach_pdf_to_certificate(cert, student_name, internship_title)

        return Response(
            {
                "message": "Feedback submitted. Certificate issued.",
                "feedback": {"rating": feedback.rating, "comment": feedback.comment},
                "certificate": CertificateSerializer(cert).data,
            },
            status=status.HTTP_201_CREATED
        )


# ✅ Student downloads/view own certificate by application_id
class MyCertificateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, application_id: int):
        application = get_object_or_404(Application, id=application_id)

        if application.student_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        if not hasattr(application, "certificate"):
            return Response({"detail": "Certificate not available yet."}, status=status.HTTP_404_NOT_FOUND)

        return Response(CertificateSerializer(application.certificate).data)


# ✅ Public verify
class VerifyCertificateAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, token: str):
        cert = Certificate.objects.filter(
            verify_token=token
        ).select_related("application", "application__internship").first()

        if not cert:
            return Response({"valid": False}, status=status.HTTP_404_NOT_FOUND)

        app = cert.application
        return Response({
            "valid": True,
            "certificate_no": cert.certificate_no,
            "issued_at": cert.issued_at,
            "student_name": app.full_name,
            "internship_title": app.internship.title,
        })


# ✅ Admin marks application completed (or any status)
class AdminUpdateApplicationStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, application_id: int):
        application = get_object_or_404(Application, id=application_id)

        ser = ApplicationStatusSerializer(application, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()

        return Response({"message": "Status updated", "status": application.status})


class NotificationViewSet(viewsets.ModelViewSet):
    """
    /api/notifications/
    - Admin: create/update/delete
    - Student: list/retrieve (all + specific-to-me)
    """
    serializer_class = AdminNotificationSerializer
    queryset = AdminNotification.objects.all().order_by("-created_at")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        qs = AdminNotification.objects.all().order_by("-created_at")
        user = self.request.user

        if not user.is_authenticated:
            return AdminNotification.objects.none()

        # admin -> all notifications
        if user.is_staff or user.is_superuser:
            return qs

        # student -> only "all" + "specific-to-me"
        my_id = user.id
        ids = []
        for n in qs:
            if n.target_type == "all":
                ids.append(n.id)
            elif n.target_type == "specific" and isinstance(n.target_users, list) and my_id in n.target_users:
                ids.append(n.id)

        return qs.filter(id__in=ids)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)