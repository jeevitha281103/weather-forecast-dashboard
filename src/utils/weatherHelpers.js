export function getWeatherType(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return 'clear';
  if (weatherId > 800) return 'clouds';
  return 'clear';
}

export function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

export function getCardGradient(weatherType, isDay, tempC) {
  const gradients = {
    clear: isDay
      ? 'linear-gradient(135deg, #7c3a10 0%, #a84d18 40%, #c7611e 70%, #e07828 100%)'
      : 'linear-gradient(135deg, #0f1b33 0%, #1a2d50 40%, #263d60 70%, #344d70 100%)',
    clouds: isDay
      ? 'linear-gradient(135deg, #3d3510 0%, #504518 40%, #635520 70%, #766528 100%)'
      : 'linear-gradient(135deg, #0f1b33 0%, #1a2d50 40%, #263d60 70%, #344d70 100%)',
    rain: 'linear-gradient(135deg, #0d2940 0%, #163a55 40%, #1f4b6a 70%, #285c80 100%)',
    drizzle: 'linear-gradient(135deg, #0d2940 0%, #163a55 40%, #1f4b6a 70%, #285c80 100%)',
    thunderstorm: 'linear-gradient(135deg, #1a1040 0%, #281850 40%, #362060 70%, #442870 100%)',
    snow: 'linear-gradient(135deg, #142035 0%, #1e3048 40%, #28405b 70%, #32506e 100%)',
    mist: 'linear-gradient(135deg, #1a1a35 0%, #252548 40%, #30305b 70%, #3b3b6e 100%)',
  };
  let gradient = gradients[weatherType] || gradients.clear;
  if (tempC != null) {
    if (tempC > 30 && isDay) {
      gradient = gradient.replace(/#7c3a10/g, '#9c4a1a').replace(/#a84d18/g, '#c45a1a');
    } else if (tempC < 5) {
      gradient = gradient.replace(/#1a2d50/g, '#152545').replace(/#263d60/g, '#1d3355');
    }
  }
  return gradient;
}
