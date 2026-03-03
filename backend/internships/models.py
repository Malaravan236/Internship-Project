from django.db import models
from django.conf import settings

# Internship
#  model represents the internship postings created by companies
class Internship(models.Model):
    company = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    stipend = models.IntegerField()
    location = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    # image_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to="internships/", null=True, blank=True)


    def __str__(self):
        return self.title

# Application
#  model represents the applications submitted by students for internships
class Application(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE)

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    college = models.CharField(max_length=200)
    course = models.CharField(max_length=120)
    graduation_year = models.CharField(max_length=10)

    required_skills = models.TextField()


    cover_letter = models.TextField()
    resume_link = models.URLField(max_length=500, blank=True)  # Google drive link
    agree_to_terms = models.BooleanField(default=False)

    status = models.CharField(max_length=20, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} -> {self.internship.title}"
