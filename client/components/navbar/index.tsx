'use client';

import { useUser } from '@/app/hooks/user';
import { signIn, signOut } from 'next-auth/react';

import Image from 'next/image';
import React from 'react';
import { Button } from '../button';
import { Container } from '../container';
import { Flex } from '../flex';
import {
  Navbar as NavbarCapsule,
  NavbarLanguageChangerIcon,
  NavbarLanguageChanger,
  NavbarLeftWrapper,
  NavbarLogo,
  NavbarLanguageFlag,
  NavbarRightWrapper,
  NavbarListItem,
  NavbarMenuList,
  NavbarListLink,
} from './styles';

export default function Navbar() {
  const { session, status } = useUser();

  return (
    <NavbarCapsule>
      <Container>
        <Flex justifyContent="space-between">
          <NavbarLeftWrapper>
            <NavbarLogo>Logo</NavbarLogo>
            <NavbarLanguageChanger>
              <NavbarLanguageFlag>
                <Image
                  fill
                  alt="Flashbang"
                  src="/tr-flag.webp"
                  sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
                  priority
                />
              </NavbarLanguageFlag>
              <NavbarLanguageChangerIcon />
            </NavbarLanguageChanger>
          </NavbarLeftWrapper>
          <NavbarRightWrapper>
            <NavbarMenuList>
              <NavbarListItem>
                <NavbarListLink href="/">Ads</NavbarListLink>
              </NavbarListItem>
              <NavbarListItem>
                <NavbarListLink href="/">Forum</NavbarListLink>
              </NavbarListItem>
              <NavbarListItem>
                <NavbarListLink href="/">FAQ</NavbarListLink>
              </NavbarListItem>
              {session && status === 'authenticated' ? (
                <Button onClick={() => signOut({ callbackUrl: '/' })} boxShadow="0px 11px 23px rgba(0, 0, 0, 0.25)">
                  Out
                </Button>
              ) : (
                <Button onClick={() => signIn()} boxShadow="0px 11px 23px rgba(0, 0, 0, 0.25)">
                  Log in / Register
                </Button>
              )}
            </NavbarMenuList>
          </NavbarRightWrapper>
        </Flex>
      </Container>
    </NavbarCapsule>
  );
}
