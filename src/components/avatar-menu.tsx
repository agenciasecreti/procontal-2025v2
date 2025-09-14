'use client';

import { RolesNames } from '@/app/admin/usuarios/components/utils';
import { useAuth } from '@/hooks/use-auth';
import { DoorClosed, Presentation, UserCircle2Icon, UserCog2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const AvatarMenu = () => {
  const { user } = useAuth();
  const role = RolesNames[user?.role || 'guest'];
  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{user?.name}</p>
                <p className="text-muted-foreground text-xs leading-none">{user?.email}</p>
                <p className="text-muted-foreground text-xs leading-none">{role?.name}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {user.role === 'admin' || user.role === 'super' ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <UserCog2 className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              {user.role === 'admin' || user.role === 'super' || user.role === 'client' ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/painel">
                      <Presentation className="h-4 w-4" />
                      Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <UserCircle2Icon className="h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sair">
                  <DoorClosed className="h-4 w-4" />
                  Sair
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login" className="flex items-center gap-2 text-sm font-medium">
          <DoorClosed className="h-4 w-4" />
          Entrar
        </Link>
      )}
    </>
  );
};

export default AvatarMenu;
