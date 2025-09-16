import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ManualForm from './ManualForm'
import { UserProvider, useUser } from './context/UserContext'

function BRProvider({ children }: { children: React.ReactNode }) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <UserProvider>
        {children}
      </UserProvider>
    )
  }
  return <Wrapper>{children}</Wrapper>
}

describe('BR permissions', () => {
  it('disables most editing for BR but allows Bearbeiter exceptions', () => {
    // Render ManualForm with BR role by mocking useUser
    jest.spyOn(require('./context/UserContext'), 'useUser').mockReturnValue({
      userName: 'BR User',
      group: 'Group',
      role: 'BR',
      setRole: () => {},
    })
    render(<ManualForm />)

    // Open Bearbeiter panel
    fireEvent.click(screen.getByRole('button', { name: /Bearbeiter/i }))
    // Should have edit enabled for ASP BR
    expect(screen.getByText('ASP BR')).toBeInTheDocument()
    // Find edit buttons (pencil) near labels
    // We just assert the button next to ASP BR is enabled by clicking it
    const aspBREntry = screen.getByText('ASP BR').closest('div')!.parentElement!
    const editBtn = aspBREntry.querySelector('button') as HTMLButtonElement
    expect(editBtn).toBeEnabled()

    // Fields like ASP HR should be disabled
    const aspHREntry = screen.getByText('ASP HR').closest('div')!.parentElement!
    const aspHrBtn = aspHREntry.querySelector('button') as HTMLButtonElement
    expect(aspHrBtn).toBeDisabled()
  })
})

