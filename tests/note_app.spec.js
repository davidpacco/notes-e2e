const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createNote } = require('./helper')

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'testpassword'
      }
    })

    await page.goto('/')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2024')).toBeVisible()
  })

  test('user can login with correct credentials', async ({ page }) => {
    await loginWith(page, 'testuser', 'testpassword')
    await expect(page.getByText('Test User logged-in')).toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'testpassword')
    })

    test('a note can be created', async ({ page }) => {
      await createNote(page, 'note created by playwright')
      await expect(page.getByText('note created by playwright')).toBeVisible()
    })

    describe('and several notes exist', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'first note')
        await createNote(page, 'second note')
        await createNote(page, 'third note')
      })

      test('importance can be changed', async ({ page }) => {
        await page.pause()
        const otherNoteText = await page.getByText('second note')
        const otherNoteElement = await otherNoteText.locator('..')

        await otherNoteElement.getByRole('button', { name: 'Make not important' }).click()
        await expect(otherNoteElement.getByText('Make important')).toBeVisible()
      })
    })

  })

  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByTestId('username').fill('testuser')
    await page.getByTestId('password').fill('otherpassword')
    await page.getByRole('button', { name: 'Login' }).click()

    const errorDiv = await page.locator('.error')

    await expect(errorDiv).toContainText('Wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

    await expect(page.getByText('Test User logged-in')).not.toBeVisible()
  })
})