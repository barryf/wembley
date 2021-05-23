function isValidURL (string) {
  try {
    new URL(string) // eslint-disable-line
  } catch (_) {
    return false
  }
  return true
}

module.exports = isValidURL
