from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """
    POST /api/login/
    body: {"email": "...", "password": "..."} OR {"username": "...", "password": "..."}
    returns: access_token, refresh_token, user
    """
    email = request.data.get("email")
    username = request.data.get("username")
    password = request.data.get("password")

    if not password or (not email and not username):
        return Response(
            {"detail": "email/username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = None

    # Try email first (common for custom user models)
    if email:
        # Many projects set USERNAME_FIELD="email", so username=email works
        user = authenticate(request, username=email, password=password)

        # Some custom backends accept email kwarg
        if user is None:
            try:
                user = authenticate(request, email=email, password=password)
            except TypeError:
                user = None

    # Fallback to username
    if user is None and username:
        user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "refresh_token": str(refresh),
            "access_token": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": getattr(user, "username", "") or "",
                "email": getattr(user, "email", "") or "",
                "role": getattr(user, "role", "") or "",
                "is_staff": bool(user.is_staff),
                "is_superuser": bool(getattr(user, "is_superuser", False)),
            },
        },
        status=status.HTTP_200_OK,
    )


class UserProfileView(APIView):
    """
    GET /api/users/me/
    Requires Authorization: Bearer <token>
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": getattr(user, "username", "") or "",
                "email": getattr(user, "email", "") or "",
                "role": getattr(user, "role", "") or "",
                "is_staff": bool(user.is_staff),
                "is_superuser": bool(getattr(user, "is_superuser", False)),
            },
            status=status.HTTP_200_OK,
        )