from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    InternshipViewSet,
    ApplicationViewSet,
    FeedbackCreateAPIView,
    MyCertificateAPIView,
    VerifyCertificateAPIView,
    AdminUpdateApplicationStatusAPIView,
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r"internships", InternshipViewSet, basename="internship")
router.register(r"applications", ApplicationViewSet, basename="application")
router.register(r"notifications", NotificationViewSet, basename="notifications")

urlpatterns = [
    # ViewSet routes
    path("", include(router.urls)),

    # Feedback submit
    path("feedback/", FeedbackCreateAPIView.as_view(), name="feedback-create"),

    # Student certificate view
    path(
        "certificates/my/<int:application_id>/",
        MyCertificateAPIView.as_view(),
        name="my-certificate"
    ),

    # Public certificate verification
    path(
        "certificates/verify/<str:token>/",
        VerifyCertificateAPIView.as_view(),
        name="verify-certificate"
    ),

    # Admin status update
    path(
        "applications/<int:application_id>/status/",
        AdminUpdateApplicationStatusAPIView.as_view(),
        name="admin-update-status"
    ),
]