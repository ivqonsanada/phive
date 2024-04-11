<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>PHive</title>
  <link rel="stylesheet" href="{{ mix('dist/css/app.css') }}">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#FFFFFF">
</head>
<body>
  <div id="app"></div>
  <script src="{{ mix('dist/js/app.js') }}"></script>
  <script src="/iconify.min.js"></script>
  <script src="/icon-bundle.js"></script>
  @production
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
      });
    }
  </script>
  @endproduction
  <noscript>Your browser does not support JavaScript!</noscript>
</body>
</html>
