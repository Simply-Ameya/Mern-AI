export const getWeather = async (city) => {
  return {
    city,
    temperature: "30°C",
    condition: "Partly Cloudy",
    humidity: "60%",
  };
};

export const calculate = async (expression) => {
  try {
    const result = eval(expression);
    return result.toString();
  } catch {
    return "Invalid expression";
  }
};

export const getCurrentTime = async () => {
  const now = new Date();
  return now.toLocaleTimeString();
};
