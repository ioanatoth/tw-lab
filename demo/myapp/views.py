from django.shortcuts import render, HttpResponse


def home(request):
    return HttpResponse("hello world")


def books_page(request):
    return render(request, "./html/books.html")
