import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Admin() {
  return (
    <>
        <Container>
            <SectionTitle
                title='Admin'
                align='center'
            />
            <div className='text-9xl text-black'>
                Hi there! I am the Admin.tsx page.
            </div>
        </Container>
    </>
  )
}
