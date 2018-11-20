import { Version, ServiceKey } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { PageContext } from '@microsoft/sp-page-context';

import * as strings from 'TeamsVideoRecorderWebPartStrings';
import "reflect-metadata";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { MSGraphClient } from '@microsoft/sp-http';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { IDigestCache, DigestCache } from '@microsoft/sp-http';

require('zone.js');

export interface ITeamsVideoRecorderWebPartProps {

}

export default class TeamsVideoRecorderWebPart extends BaseClientSideWebPart<ITeamsVideoRecorderWebPartProps> {

  private teamsContext: microsoftTeams.Context;

  protected onInit(): Promise<any> {

    let retVal: Promise<any> = Promise.resolve();

    if (this.context.microsoftTeams) {
      retVal = new Promise((resolve, reject) => {
        this.context.microsoftTeams.getContext(context => {
          this.teamsContext = context;
          resolve();
        });
      });
    }

    return retVal;
  }

  public render(): void {

    window['context'] = this.context;
    window['teamscontext'] = this.teamsContext;

    this.domElement.innerHTML = '<app-root></app-root>';
    platformBrowserDynamic().bootstrapModule(AppModule);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
