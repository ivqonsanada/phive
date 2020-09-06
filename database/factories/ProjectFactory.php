<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Project;
use Faker\Generator as Faker;

$factory->define(Project::class, function (Faker $faker) {
    return [
        'user_id' => 1,
        'name' => $faker->streetName,
        'description' => $faker->text,
        'salary' => $faker->numberBetween,
        'certificate' => $faker->boolean,
        'max_person' => $faker->randomDigit,
        'image' => $faker->imageUrl
    ];
});

