export const categoryFallbacks = {
    Eletronicos: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
    Moda:        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    Casa:        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80',
    Beleza:      'https://images.unsplash.com/photo-1522335789203-aaa312bb1c43?auto=format&fit=crop&w=900&q=80',
    Esportes:    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    Pet:         'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
    Livros:      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
    Brinquedos:  'https://images.unsplash.com/photo-1558877385-8c1f8b9c2d9d?auto=format&fit=crop&w=900&q=80',
    Alimentos:   'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    Automotivo:  'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=80',
};

export function getProductFallback(category) {
    const normalizedCategory = String(category || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

    return categoryFallbacks[normalizedCategory]
        || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80';
}
