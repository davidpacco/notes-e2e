const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.getByTestId('username').fill('testuser')
  await page.getByTestId('password').fill('testpassword')
  await page.getByRole('button', { name: 'Login' }).click()
}

const createNote = async (page, content) => {
  await page.getByRole('button', { name: 'New note' }).click()
  await page.getByTestId('note-input').fill(content)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByText(content).waitFor()
}

export { loginWith, createNote }