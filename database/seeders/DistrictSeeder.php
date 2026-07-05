<?php

namespace Database\Seeders;

use App\Models\District;
use Illuminate\Database\Seeder;

class DistrictSeeder extends Seeder
{
    public function run(): void
    {
        $districts = [
            'Kigali City' => ['Gasabo', 'Kicukiro', 'Nyarugenge'],
            'Northern' => ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
            'Southern' => ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
            'Eastern' => ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
            'Western' => ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
        ];

        foreach ($districts as $province => $names) {
            foreach ($names as $name) {
                District::query()->firstOrCreate([
                    'name' => $name,
                    'province' => $province,
                ]);
            }
        }
    }
}
