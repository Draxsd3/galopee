const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function fileToImageDataUrl(file) {
    if (!file) return Promise.resolve('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
        return Promise.reject(new Error('Use uma imagem JPG, PNG, WEBP ou GIF.'));
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return Promise.reject(new Error('A imagem deve ter no máximo 3MB.'));
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.readAsDataURL(file);
    });
}
