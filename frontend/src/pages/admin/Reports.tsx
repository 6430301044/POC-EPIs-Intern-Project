import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Reports() {
  return (
    <>
        <Container>
            <SectionTitle 
                title='Report'
                align='center'
            />
            <div>
                Hi there! I am the Report.tsx page.
            </div>
        </Container>
    </>
  )
}
