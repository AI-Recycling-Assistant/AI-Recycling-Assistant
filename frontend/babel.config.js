// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // import.meta를 Hermes/Web에서 쓸 수 있게 변환해주는 옵션
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: ["expo-router/babel"],
  };
};
