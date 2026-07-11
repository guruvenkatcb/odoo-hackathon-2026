from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Item
        fields = ['id', 'title', 'description', 'owner', 'owner_username', 'created_at', 'updated_at']
        read_only_fields = ['owner']

    def validate_title(self, value):
        # Example of backend input validation - the hackathon rules
        # explicitly grade this, so keep validators like this on every field.
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be under 200 characters.")
        return value.strip()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user
