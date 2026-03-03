from rest_framework import serializers
from accounts.models import Internship, Application, Feedback, Certificate,AdminNotification


class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = "__all__"


class ApplicationSerializer(serializers.ModelSerializer):
    # frontend "resume_link" send panna accept pannitu model resume_drive_link la store pannuvom
    resume_link = serializers.URLField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "internship",
            "student",
            "full_name",
            "email",
            "phone",
            "college",
            "course",
            "graduation_year",
            "cover_letter",
            "resume_link",
            "status",
            "applied_at",
        ]
        read_only_fields = ["id", "student", "status", "applied_at"]

    def validate(self, attrs):
        request = self.context.get("request")

        # resume_link -> resume_drive_link
        resume_link = attrs.pop("resume_link", None)
        if resume_link is not None:
            attrs["resume_drive_link"] = resume_link

        # prevent duplicate apply
        if request and request.user and request.user.is_authenticated:
            internship = attrs.get("internship")
            if internship and Application.objects.filter(student=request.user, internship=internship).exists():
                raise serializers.ValidationError({"internship": "Already applied for this internship."})

        return attrs


class FeedbackCreateSerializer(serializers.ModelSerializer):
    application_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Feedback
        fields = ["application_id", "rating", "comment"]

    def validate_rating(self, v):
        if v < 1 or v > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return v


class CertificateSerializer(serializers.ModelSerializer):
    pdf = serializers.FileField(read_only=True)

    class Meta:
        model = Certificate
        fields = ["certificate_no", "issued_at", "verify_token", "pdf", "pdf_url"]


class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]
        

class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = [
            "id",
            "title",
            "message",
            "target_type",
            "target_users",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]       