const images: string[] = [
    "../MEDIA/g1.jpeg",
    "../MEDIA/g2.jpeg",
    "../MEDIA/g3.jpeg"
];

const mainImage = document.getElementById("carousel-image") as HTMLImageElement;

if (!mainImage) {
    throw new Error("Nu s-a găsit elementul imagine pentru carusel!");
}

let currentIndex: number = 0;

function showNextImage(): void {
    currentIndex = (currentIndex + 1) % images.length;
    mainImage.src = images[currentIndex]!;
}

setInterval(showNextImage, 3000);