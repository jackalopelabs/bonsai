<?php

namespace App\View\Components\Bonsai;

use Illuminate\View\Component;

class BaseComponent extends Component
{
    public function render()
    {
        // Get the component name from the class name
        $name = strtolower(class_basename($this));
        return view("bonsai.components.{$name}");
    }
}