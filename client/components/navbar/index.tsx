'use client';

import { useUser } from '@/app/hooks/user';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '../button';
import { Container } from '../container';
import { Flex } from '../flex';
import {
  NavbarLanguageChangerIcon,
  NavbarLanguageChanger,
  NavbarLeftWrapper,
  NavbarLogo,
  NavbarLanguageFlag,
  NavbarRightWrapper,
  NavbarListItem,
  NavbarMenuList,
} from './styles';

export default function Navbar() {
  const { status } = useUser();
  return (
    <Container mt="30">
      <Flex justifyContent="space-between">
        <NavbarLeftWrapper>
          <NavbarLogo>Logo</NavbarLogo>
          <NavbarLanguageChanger>
            <NavbarLanguageFlag>
              <Image fill alt="Flashbang" src="/tr-flag.webp" sizes="100vw" />
            </NavbarLanguageFlag>
            <NavbarLanguageChangerIcon />
          </NavbarLanguageChanger>
        </NavbarLeftWrapper>
        <NavbarRightWrapper>
          <NavbarMenuList>
            <NavbarListItem>
              <Link href="/">Ads</Link>
            </NavbarListItem>
            <NavbarListItem>
              <Link href="/">Forum</Link>
            </NavbarListItem>
            <NavbarListItem>
              <Link href="/">FAQ</Link>
            </NavbarListItem>
            {status === 'unauthenticated' ? (
              <Button onClick={() => signIn()}>Login/Register</Button>
            ) : (
              <Button onClick={() => signOut()}>Out</Button>
            )}
          </NavbarMenuList>
        </NavbarRightWrapper>
      </Flex>
    </Container>
  );
}
