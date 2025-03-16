{{-- 
    Template Name: Cypress Template
--}}
@extends('bonsai.chosen.layouts.chosen')

@section('content')
    @include('bonsai.sections.home_hero')
    @include('bonsai.sections.services_card')
    @include('bonsai.sections.features_widget')
    @include('bonsai.sections.kanban_section')
    @include('bonsai.sections.pricing')
    @include('bonsai.sections.site_footer')
@endsection