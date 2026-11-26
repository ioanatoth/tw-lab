from django.shortcuts import render, HttpResponse


def home(request):
    return HttpResponse("hello world")


def joke_page(request):
    return render(request, "./html/joke.html")