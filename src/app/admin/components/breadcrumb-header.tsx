import React from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb';

export default function BreadcrumbHeader({
  links,
}: {
  links: { name: string; href?: string; active?: boolean }[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="hidden lg:flex">
        {links.map((link, index) => (
          <React.Fragment key={link.name}>
            {link.name !== '...' ? (
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={link.href}
                  className={link.active ? 'text-secondary font-semibold' : 'text-muted-foreground'}
                >
                  {link.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
            )}
            {index < links.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
      {links[links.length - 1].name && (
        <BreadcrumbItem className="lg:hidden">
          <p className="text-secondary font-semibold">{links[links.length - 1].name}</p>
        </BreadcrumbItem>
      )}
    </Breadcrumb>
  );
}
