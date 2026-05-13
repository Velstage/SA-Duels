function filterImages(images, selectedTags) {
  if (selectedTags.length === 0) return images;
  return images.filter(img =>
    selectedTags.every(tag => img.tags.includes(tag))
  );
}
