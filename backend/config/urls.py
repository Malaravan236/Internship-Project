# # # # from django.contrib import admin
# # # # from django.urls import path, include
# # # # from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# # # # from django.http import JsonResponse

# # # # def home(request):
# # # #     return JsonResponse({"status": "Backend running ✅"})

# # # # urlpatterns = [
# # # #     path("", home),

# # # #     path("admin/", admin.site.urls),

# # # #     path("api/", include("accounts.urls")),
# # # #     path("api/", include("internships.urls")),

# # # #     # ✅ JWT endpoints
# # # #     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
# # # #     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# # # # ]


# # # # # http://127.0.0.1:8000/api/internships/

# # # # # http://127.0.0.1:8000/api/applications/

# # # from django.contrib import admin
# # # from django.urls import path, include
# # # from django.http import JsonResponse
# # # from rest_framework_simplejwt.views import (
# # #     TokenObtainPairView,
# # #     TokenRefreshView,
# # # )

# # # # Optional: backend home test
# # # def home(request):
# # #     return JsonResponse({"status": "Backend running ✅"})

# # # urlpatterns = [
# # #     # Root test
# # #     path("", home),

# # #     # Admin
# # #     path("admin/", admin.site.urls),

# # #     # Accounts app (register, login, profile etc)
# # #     path("api/", include("accounts.urls")),

# # #     # Internships app
# # #     path("api/", include("internships.urls")),

# # #     # ✅ JWT Login endpoints
# # #     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
# # #     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# # # ]

# # from django.contrib import admin
# # from django.urls import path, include
# # from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# # from django.http import JsonResponse

# # def home(request):
# #     return JsonResponse({"status": "Backend running ✅"})

# # urlpatterns = [
# #     path("", home),
# #     path("admin/", admin.site.urls),

# #     # APIs
# #     path("api/", include("internships.urls")),
# #     path("api/", include("accounts.urls")),   # <-- IMPORTANT if applications in accounts

# #     # JWT
# #     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
# #     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# # ]


# from django.contrib import admin
# from django.urls import path, include
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from django.http import JsonResponse

# def home(request):
#     return JsonResponse({"status": "Backend running ✅"})

# urlpatterns = [
#     path("", home),
#     path("admin/", admin.site.urls),

#     # internships + applications API
#     path("api/", include("internships.urls")),

#     # JWT token endpoints (login)
#     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# ]


from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def home(request):
    return JsonResponse({"status": "Backend running ✅"})

urlpatterns = [
    path("", home),

    # Admin
    path("admin/", admin.site.urls),

    # ✅ Apps include here (IMPORTANT)
    path("api/", include("accounts.urls")),
    path("api/", include("internships.urls")),

    # JWT login
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# 🔥 VERY IMPORTANT (IMAGE SERVE)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)