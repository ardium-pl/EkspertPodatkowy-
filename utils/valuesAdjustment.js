export function removeDecimal(num) {
    return Number(num.toString().replace('.', ''));
}

export function mapVatRate(vatRate) {
    const vatRateMapping = {
        23: 0,
        8: 1,
        5: 7
    };

    return vatRateMapping[vatRate] !== undefined ? vatRateMapping[vatRate] : null;
}
