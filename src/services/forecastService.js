export const forecastService = { byCrop: (data, cropId, months = 6) => data.forecasts.filter((record) => record.cropId === cropId).slice(0, months) };
