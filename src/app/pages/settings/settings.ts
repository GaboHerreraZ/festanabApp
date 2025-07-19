import { Component } from '@angular/core';
import { Module } from './components/module/module';
import { Setting } from './components/setting/setting';

@Component({
    selector: 'app-settings',
    imports: [Module, Setting],
    standalone: true,
    templateUrl: './settings.html'
})
export class Settings {}
