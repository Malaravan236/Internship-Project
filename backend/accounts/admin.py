from django.contrib import admin
from .models import (
    User, StudentProfile, CompanyProfile,
    Internship, Application, ApplicationStatusHistory,
    Document, Certificate, Notification, SavedInternship,Feedback,
)

admin.site.register(User)
admin.site.register(StudentProfile)
admin.site.register(CompanyProfile)

admin.site.register(Internship)
admin.site.register(Application)
admin.site.register(ApplicationStatusHistory)
admin.site.register(Feedback)
admin.site.register(Document)
admin.site.register(Certificate)
admin.site.register(Notification)
admin.site.register(SavedInternship)
