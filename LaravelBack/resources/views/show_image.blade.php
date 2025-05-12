<!-- resources/views/show_image.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Display Image</title>
</head>
<body>



    <div class="product-image">

        <p>the image displays</p>
        <img src="{{ asset('storage/products/Nymy77EQ0sxpNKSl5leqeqhDQFXu2L2Noqwprzas.jpg') }}" alt="Product Image">
    </div>
</body>
</html>

<?php
        // $pathFromDatabase = 'products/Oq1i9bj4OV9TRfbpqpLQMyojjv5fvJd3snCy4S1Q.png';
        // $fullPath = public_path($pathFromDatabase);
        // echo '<p>Full path of the image: '.$fullPath.'</p>';
        
        
    ?>
