from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("joke/", views.joke_page, name="joke_page"),
]