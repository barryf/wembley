function view (locals) {
  return `
    <pre>${JSON.stringify(locals, null, 2)}</pre>
  `
}

module.exports = view
