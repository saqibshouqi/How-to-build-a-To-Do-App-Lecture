(function () {
    const STORAGE_KEY = 'todos-v1'
    let todos = []
    let filter = 'all'
    const qs = s => document.querySelector(s)

    const listEl = qs('#todo-list')
    const inputEl = qs('#todo-input')
    const form = qs('#todo-form')
    const countEl = qs('#count')
    const filters = Array.from(document.querySelectorAll('.filter'))
    const clearBtn = qs('#clear-completed')

    function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)) }
    function load() { try { todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch (e) { todos = [] } }
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

    function addTodo(text) { if (!text || !text.trim()) return; todos.unshift({ id: uid(), text: text.trim(), progress: 0, completed: false }); save(); render() }
    function updateTodo(id, patch) { todos = todos.map(t => t.id === id ? Object.assign({}, t, patch) : t); save(); render() }
    function removeTodo(id) { todos = todos.filter(t => t.id !== id); save(); render() }
    function clearCompleted() { todos = todos.filter(t => t.progress < 100); save(); render() }

    function visibleTodos() { if (filter === 'active') return todos.filter(t => t.progress < 100); if (filter === 'completed') return todos.filter(t => t.progress === 100); return todos }

    function render() {
        listEl.innerHTML = ''
        const visible = visibleTodos()
        for (const t of visible) {
            const li = document.createElement('li')
            li.className = 'todo-item' + (t.progress === 100 ? ' completed' : '')
            li.dataset.id = t.id

            const chk = document.createElement('input')
            chk.type = 'checkbox'
            chk.checked = t.progress === 100
            chk.addEventListener('change', () => {
                if (chk.checked) updateTodo(t.id, { progress: 100, completed: true })
                else updateTodo(t.id, { progress: 0, completed: false })
            })

            const txtWrap = document.createElement('div')
            txtWrap.className = 'text'
            const span = document.createElement('span')
            span.textContent = t.text
            span.tabIndex = 0
            span.addEventListener('dblclick', () => startEdit(t.id, span))

            const progressBox = document.createElement('div')
            progressBox.className = 'progress-box'
            const progressLabel = document.createElement('div')
            progressLabel.className = 'task-progress'
            progressLabel.textContent = `${t.progress}%`

            const bar = document.createElement('div')
            bar.className = 'progress-bar'
            const fill = document.createElement('div')
            fill.className = 'progress-fill'
            fill.style.width = `${t.progress}%`
            bar.appendChild(fill)

            const range = document.createElement('input')
            range.type = 'range'
            range.min = 0
            range.max = 100
            range.value = t.progress
            range.className = 'progress-slider'
            range.addEventListener('input', () => {
                progressLabel.textContent = `${range.value}%`
                fill.style.width = `${range.value}%`
            })
            range.addEventListener('change', () => {
                const value = Number(range.value)
                updateTodo(t.id, { progress: value, completed: value === 100 })
            })

            progressBox.appendChild(progressLabel)
            progressBox.appendChild(bar)
            progressBox.appendChild(range)

            const editBtn = document.createElement('button')
            editBtn.className = 'btn'
            editBtn.textContent = 'Edit'
            editBtn.addEventListener('click', () => startEdit(t.id, span))

            const delBtn = document.createElement('button')
            delBtn.className = 'btn'
            delBtn.textContent = 'Delete'
            delBtn.addEventListener('click', () => removeTodo(t.id))

            txtWrap.appendChild(span)
            txtWrap.appendChild(progressBox)
            li.appendChild(chk)
            li.appendChild(txtWrap)
            li.appendChild(editBtn)
            li.appendChild(delBtn)
            listEl.appendChild(li)
        }

        countEl.textContent = `${todos.filter(t => t.progress < 100).length} items left`
        filters.forEach(b => b.classList.toggle('active', b.dataset.filter === filter))
    }

    function startEdit(id, span) {
        const li = span.closest('li')
        const current = todos.find(t => t.id === id)
        if (!current) return
        const input = document.createElement('input')
        input.className = 'edit-input'
        input.value = current.text
        span.replaceWith(input)
        input.focus()

        function commit() {
            const v = input.value.trim()
            if (v) updateTodo(id, { text: v })
            else removeTodo(id)
        }

        input.addEventListener('blur', () => { commit() })
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { input.blur() }
            if (e.key === 'Escape') { render() }
        })
    }

    // events
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        addTodo(inputEl.value)
        inputEl.value = ''
        inputEl.focus()
    })

    filters.forEach(b => b.addEventListener('click', () => {
        filter = b.dataset.filter
        render()
    }))

    clearBtn.addEventListener('click', () => clearCompleted())

    // init
    load()
    render()
})();
