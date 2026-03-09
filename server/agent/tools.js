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
    return {
      expression,
      result,
    };
  } catch {
    return { error: "Invalid expression" };
  }
};

export const getCurrentTime = async () => {
  return {
    time: new Date().toLocaleTimeString(),
  };
};
