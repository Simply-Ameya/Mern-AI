export const getWeather = async (city) => {
  return `Weather in ${city} is 30°C`;
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
