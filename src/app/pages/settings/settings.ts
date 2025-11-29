import { Component } from '@angular/core';
import { Module } from './components/module/module';
import { Setting } from './components/setting/setting';
import { Services } from './components/services/services';

@Component({
    selector: 'app-settings',
    imports: [Module, Setting, Services],
    standalone: true,
    templateUrl: './settings.html'
})
export class Settings {}
