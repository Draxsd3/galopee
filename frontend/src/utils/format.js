export function formatPrice(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 'R$ 0,00';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return String(iso);
    }
}

export const statusLabels = {
    pending:   'Pendente',
    paid:      'Pago',
    shipped:   'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
};

export const paymentLabels = {
    pending:    'Aguardando',
    processing: 'Processando',
    approved:   'Aprovado',
    refused:    'Recusado',
    refunded:   'Reembolsado',
};

export function statusBadgeClass(status) {
    switch (status) {
        case 'paid':      return 'badge-blue';
        case 'shipped':   return 'badge-yellow';
        case 'delivered': return 'badge-green';
        case 'cancelled': return 'badge-red';
        default:          return 'badge-slate';
    }
}
