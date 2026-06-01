import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import BackToTop from '../../components/BackToTop'

describe('BackToTop', () => {
  it('renders a button', () => {
    const { container } = render(<BackToTop />)
    const btn = container.querySelector('button')
    expect(btn).toBeInTheDocument()
  })
})
