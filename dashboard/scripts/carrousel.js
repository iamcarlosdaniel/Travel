function getCarrouselInformation() {
  const touristPlacesRef = db.collection('touristPlaces');

  // Obtén los documentos de la colección
  touristPlacesRef.get().then((querySnapshot) => {
    const carouselInner = document.getElementById('carousel-inner');

    querySnapshot.forEach((doc) => {
      // Para cada documento, crea un nuevo carrusel-item
      const carouselItem = document.createElement('div');
      carouselItem.className = 'carousel-item';
      if (carouselInner.childElementCount === 0) {
        carouselItem.classList.add('active');
      }

      // Rellena el contenido del carrusel-item con los datos del documento
    const ratingStars = Array.from({ length: doc.data().rating }, () => '<i class="bi bi-star-fill m-1"></i>').join('');

      // Rellena el contenido del carrusel-item con los datos del documento
      carouselItem.innerHTML = `
        <div class="card text-bg-dark border-light">
          <img src="${doc.data().images[0]}" class="card-img w-100" alt="" style="object-fit: cover; height: 230px; filter: brightness(0.5);">
          <div class="card-img-overlay mx-5">
            <p class="card-title fs-3 mb-0 text-truncate overflow-hidden">${doc.data().placeName}</p>
            <p class="card-text">${ratingStars}</p>
            <p style="max-height: 100px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${doc.data().description}
            </p>
            <button class="btn btn-outline-light my-1" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">Learn more</a>
          </div>
        </div>
      `;

      // Agrega el carrusel-item al carrusel-inner
      carouselInner.appendChild(carouselItem);
    });
  });
}