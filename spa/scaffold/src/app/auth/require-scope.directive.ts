
import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthFacade } from './auth.facade';

@Directive({ selector: '[appRequireScope]' })
export class RequireScopeDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthFacade);

  @Input('appRequireScope') set required(scopesOrRoles: string[] | string) {
    const list = Array.isArray(scopesOrRoles) ? scopesOrRoles : [scopesOrRoles];
    this.vcr.clear();
    if (this.auth.hasAnyScopeOrRole(list)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
