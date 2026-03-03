from django.urls import path
from .views import login_user, UserProfileView

urlpatterns = [
    # login
    path("login/", login_user, name="login"),

    # profile (NEW)
    path("users/me/", UserProfileView.as_view(), name="user-profile"),
]
