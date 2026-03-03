from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
import uuid


# -------------------------
# 1) USERS + ROLES
# -------------------------
class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        COMPANY = "company", "Company"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)

    def __str__(self):
        return f"{self.username} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    college = models.CharField(max_length=150, blank=True)
    course = models.CharField(max_length=120, blank=True)
    graduation_year = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"StudentProfile: {self.user.username}"


class CompanyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_profile",
    )
    company_name = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    city = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"CompanyProfile: {self.user.username}"


# -------------------------
# 2) INTERNSHIPS
# -------------------------
class Internship(models.Model):
    class LocationType(models.TextChoices):
        ONSITE = "onsite", "Onsite"
        REMOTE = "remote", "Remote"
        HYBRID = "hybrid", "Hybrid"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    required_skills = models.TextField(blank=True, help_text="Comma separated skills")

    number_of_positions = models.PositiveIntegerField(default=1)
    department = models.CharField(max_length=120, blank=True)
    eligibility_criteria = models.TextField(blank=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    duration = models.CharField(max_length=80, blank=True)
    work_hours = models.CharField(max_length=80, blank=True)

    location_type = models.CharField(
        max_length=10, choices=LocationType.choices, default=LocationType.REMOTE
    )
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)

    is_paid = models.BooleanField(default=False)
    stipend_amount = models.CharField(max_length=50, blank=True)
    payment_mode = models.CharField(max_length=50, blank=True)

    required_skills = models.TextField()
    
    application_start_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateField(null=True, blank=True)

    coordinator_name = models.CharField(max_length=150, blank=True)
    coordinator_email = models.EmailField(blank=True)
    coordinator_phone = models.CharField(max_length=30, blank=True)

    require_resume = models.BooleanField(default=True)
    internship_image_url = models.URLField(blank=True)
    
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    agree_to_terms = models.BooleanField(default=False)


    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_internships",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# -------------------------
# 3) APPLICATIONS + STATUS HISTORY
# -------------------------
class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SHORTLISTED = "shortlisted", "Shortlisted"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        COMPLETED = "completed", "Completed"

    internship = models.ForeignKey(
        Internship, on_delete=models.CASCADE, related_name="applications"
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications"
    )

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)

    college = models.CharField(max_length=150, blank=True)
    course = models.CharField(max_length=120, blank=True)
    graduation_year = models.CharField(max_length=10, blank=True)

    cover_letter = models.TextField(blank=True)

    # IMPORTANT: this name must match serializer/frontend mapping
    resume_drive_link = models.URLField(blank=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["internship", "student"],
                name="unique_application_per_student",
            )
        ]

    def __str__(self):
        return f"{self.student.username} -> {self.internship.title} ({self.status})"


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="status_history"
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="status_changes",
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application.id}: {self.old_status} -> {self.new_status}"


# -------------------------
# 4) DOCUMENTS
# -------------------------
class Document(models.Model):
    class DocType(models.TextChoices):
        RESUME = "resume", "Resume"
        TRANSCRIPT = "transcript", "Transcript"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents"
    )
    doc_type = models.CharField(
        max_length=20, choices=DocType.choices, default=DocType.RESUME
    )
    file_url = models.URLField(blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.doc_type}"

# -------------------------
# 5) FEEDBACK / REVIEW
# -------------------------
class Feedback(models.Model):
    application = models.OneToOneField(
        "Application", on_delete=models.CASCADE, related_name="feedback"
    )
    rating = models.PositiveSmallIntegerField()  # 1..5
    comment = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedbacks"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback(app={self.application_id}, rating={self.rating})"


# -------------------------
# 5) CERTIFICATES
# -------------------------
class Certificate(models.Model):
    application = models.OneToOneField(
        Application, on_delete=models.CASCADE, related_name="certificate"
    )

    certificate_no = models.CharField(max_length=30, unique=True)
    issued_at = models.DateTimeField(default=timezone.now)

    pdf_url = models.URLField(blank=True)
    pdf = models.FileField(upload_to="certificates/", blank=True, null=True)

    verify_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"Certificate {self.certificate_no}"


# -------------------------
# 6) NOTIFICATIONS
# -------------------------
class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=150)
    message = models.TextField(blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notif -> {self.user.username}: {self.title}"


# -------------------------
# 7) SAVED INTERNSHIPS
# -------------------------
class SavedInternship(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_internships"
    )
    internship = models.ForeignKey(
        Internship, on_delete=models.CASCADE, related_name="saved_by"
    )

    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "internship"],
                name="unique_saved_internship",
            )
        ]

    def __str__(self):
        return f"{self.student.username} saved {self.internship.title}"
    

# -------------------------
# ADMIN NOTIFICATIONS (broadcast)
# -------------------------
class AdminNotification(models.Model):
    TARGET_ALL = "all"
    TARGET_SPECIFIC = "specific"
    TARGET_CHOICES = [
        (TARGET_ALL, "All Users"),
        (TARGET_SPECIFIC, "Specific Users"),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()

    target_type = models.CharField(
        max_length=20, choices=TARGET_CHOICES, default=TARGET_ALL
    )

    # store user ids: [1, 5, 9]
    target_users = models.JSONField(default=list, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_notifications_created",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.target_type})"    
