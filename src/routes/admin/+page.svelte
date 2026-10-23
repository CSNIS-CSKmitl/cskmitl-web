<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Users,
    Layers,
    Plus,
    Trash2,
    RefreshCw,
    Search,
    X,
    Loader2,
    ArrowUpRight,
    ArrowLeft
  } from '@lucide/svelte';

  // Auth State
  let loggedIn = false;
  let authChecking = true;
  let email = '';
  let password = '';
  let loginLoading = false;

  // Active Tab: 'passion-group' | 'services'
  let activeTab: 'passion-group' | 'services' = 'passion-group';

  // Data
  let services: any[] = [];
  let passionGroups: any[] = [];
  let loadingServices = false;
  let loadingGroups = false;

  // Filter / Search
  let searchGroup = '';
  let searchService = '';
  let filterServiceType = 'ทั้งหมด';

  // Modals
  let showAddGroupModal = false;
  let groupName = '';
  let groupDescription = '';
  let groupUrl = '';
  let groupOwner = '';
  let submittingGroup = false;

  let showAddServiceModal = false;
  let serviceName = '';
  let serviceDescription = '';
  let serviceUrl = '';
  let serviceType = 'Web app';
  let serviceStatus = 'พร้อมใช้งาน';
  let submittingService = false;

  // Feedback Notification
  let notification: { type: 'success' | 'error'; text: string } | null = null;
  let notificationTimer: any = null;

  function notify(type: 'success' | 'error', text: string) {
    if (notificationTimer) clearTimeout(notificationTimer);
    notification = { type, text };
    notificationTimer = setTimeout(() => {
      notification = null;
    }, 4000);
  }

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'services') {
      activeTab = 'services';
    } else {
      activeTab = 'passion-group';
    }

    try {
      const response = await fetch('/api/auth');
      if (response.ok) {
        loggedIn = true;
        await refreshAll();
      }
    } catch {
      // offline / not logged in
    } finally {
      authChecking = false;
    }
  });

  async function refreshAll() {
    await Promise.all([loadGroups(), loadServices()]);
  }

  async function loadGroups() {
    loadingGroups = true;
    try {
      const res = await fetch('/api/passion-group');
      if (res.ok) {
        passionGroups = await res.json();
      }
    } catch {
      notify('error', 'ไม่สามารถโหลดข้อมูล Passion Group ได้');
    } finally {
      loadingGroups = false;
    }
  }

  async function loadServices() {
    loadingServices = true;
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        services = await res.json();
      }
    } catch {
      notify('error', 'ไม่สามารถโหลดข้อมูล Services ได้');
    } finally {
      loadingServices = false;
    }
  }

  async function login() {
    loginLoading = true;
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        loggedIn = true;
        notify('success', 'เข้าสู่ระบบสำเร็จ');
        email = '';
        password = '';
        await refreshAll();
      } else {
        notify('error', data.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      notify('error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      loginLoading = false;
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      loggedIn = false;
      services = [];
      passionGroups = [];
      notify('success', 'ออกจากระบบแล้ว');
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  }

  async function handleAddGroup() {
    if (!groupName.trim()) {
      notify('error', 'กรุณาระบุชื่อกลุ่ม');
      return;
    }
    submittingGroup = true;
    try {
      const res = await fetch('/api/passion-group', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim(),
          url: groupUrl.trim(),
          owner_name: groupOwner.trim()
        })
      });
      if (res.ok) {
        notify('success', `เพิ่ม "${groupName}" เรียบร้อยแล้ว`);
        groupName = '';
        groupDescription = '';
        groupUrl = '';
        groupOwner = '';
        showAddGroupModal = false;
        await loadGroups();
      } else {
        const data = await res.json().catch(() => ({}));
        notify('error', data.error || 'เพิ่มข้อมูลไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      submittingGroup = false;
    }
  }

  async function handleDeleteGroup(id: string, name: string) {
    if (!confirm(`คุณต้องการลบ Passion Group "${name}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch('/api/passion-group', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        notify('success', `ลบกลุ่ม "${name}" เรียบร้อยแล้ว`);
        passionGroups = passionGroups.filter((g) => g.id !== id);
      } else {
        notify('error', 'ลบไม่สำเร็จ หรือไม่มีสิทธิ์ admin');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  }

  async function handleAddService() {
    if (!serviceName.trim()) {
      notify('error', 'กรุณาระบุชื่อบริการ');
      return;
    }
    submittingService = true;
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: serviceName.trim(),
          description: serviceDescription.trim(),
          type: serviceType,
          status: serviceStatus,
          url: serviceUrl.trim() || undefined
        })
      });
      if (res.ok) {
        notify('success', `เพิ่มบริการ "${serviceName}" เรียบร้อยแล้ว`);
        serviceName = '';
        serviceDescription = '';
        serviceUrl = '';
        showAddServiceModal = false;
        await loadServices();
      } else {
        notify('error', 'เพิ่มบริการไม่สำเร็จ');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      submittingService = false;
    }
  }

  async function handleDeleteService(id: string, name: string) {
    if (!confirm(`คุณต้องการลบบริการ "${name}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        notify('success', `ลบบริการ "${name}" เรียบร้อยแล้ว`);
        services = services.filter((s) => s.id !== id);
      } else {
        notify('error', 'ลบไม่สำเร็จ');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการลบ');
    }
  }

  $: filteredGroups = passionGroups.filter((g) => {
    const term = searchGroup.toLowerCase();
    const name = (g.name || g.title || '').toLowerCase();
    const desc = (g.description || g.detail || '').toLowerCase();
    const owner = (g.owner_name || '').toLowerCase();
    return name.includes(term) || desc.includes(term) || owner.includes(term);
  });

  $: filteredServices = services.filter((s) => {
    const term = searchService.toLowerCase();
    const matchesType = filterServiceType === 'ทั้งหมด' || s.type === filterServiceType;
    const matchesSearch =
      (s.name || '').toLowerCase().includes(term) ||
      (s.description || '').toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });
</script>

<svelte:head>
  <title>Admin — CS-KMITL Hub</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
  <!-- Toast Notification (Clean & Non-neon) -->
  {#if notification}
    <aside
      aria-label="Notification"
      class="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-md {notification.type ===
      'success'
        ? 'border-slate-200 text-slate-800'
        : 'border-rose-200 text-rose-900'}"
    >
      <span
        class="size-2 rounded-full {notification.type === 'success'
          ? 'bg-orange-500'
          : 'bg-rose-600'}"
      ></span>
      <p class="flex-1 text-xs font-medium">{notification.text}</p>
      <button
        onclick={() => (notification = null)}
        class="text-slate-400 hover:text-slate-700"
        aria-label="ปิดแจ้งเตือน"
      >
        <X size={14} />
      </button>
    </aside>
  {/if}

  <!-- Header -->
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-2.5 font-bold hover:opacity-90 transition">
          <span class="grid size-9 place-items-center rounded-xl bg-orange-500 text-sm font-bold text-white">
            CS
          </span>
          <span class="text-sm font-bold text-slate-900">CS-KMITL Hub</span>
          <span class="text-xs font-semibold text-orange-600">Admin</span>
        </a>
      </div>

      <nav class="flex items-center gap-3 text-sm">
        <a
          href="/"
          class="text-slate-600 transition hover:text-orange-600 font-medium"
        >
          ← หน้า Hub
        </a>
        <a
          href="/passion-group"
          target="_blank"
          class="hidden sm:inline-flex items-center gap-1 text-slate-600 transition hover:text-orange-600 font-medium"
        >
          ดู Passion Groups
          <ArrowUpRight size={14} class="text-slate-400" />
        </a>

        {#if loggedIn}
          <div class="h-4 w-px bg-slate-200"></div>
          <button
            onclick={logout}
            class="text-sm font-medium text-slate-500 transition hover:text-rose-600"
          >
            ออกจากระบบ
          </button>
        {/if}
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-6 py-10">
    {#if authChecking}
      <div class="flex min-h-[40vh] items-center justify-center">
        <Loader2 class="size-6 animate-spin text-orange-500" />
      </div>
    {:else if !loggedIn}
      <!-- Login -->
      <div class="mx-auto mt-10 max-w-sm">
        <div class="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div class="mb-6">
            <h1 class="text-xl font-bold tracking-tight text-slate-900">เข้าสู่ระบบ Admin</h1>
            <p class="mt-1 text-xs text-slate-500">
              จัดการบริการ Services และกลุ่ม Passion Groups
            </p>
          </div>

          <!-- KMITL OIDC Single Sign-On Button -->
          <a
            href="/auth/oidc"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <span>เข้าสู่ระบบด้วย KMITL Account (OIDC)</span>
          </a>

          <div class="my-5 flex items-center gap-3">
            <div class="h-px flex-1 bg-slate-200"></div>
            <span class="text-xs text-slate-400 font-medium">หรือเข้าสู่ระบบด้วยรหัสผ่าน</span>
            <div class="h-px flex-1 bg-slate-200"></div>
          </div>

          <form
            onsubmit={(e) => {
              e.preventDefault();
              login();
            }}
            class="space-y-4"
          >
            <div>
              <label for="admin-email" class="block text-xs font-medium text-slate-700">
                อีเมล
              </label>
              <input
                id="admin-email"
                bind:value={email}
                type="email"
                placeholder="Admin email"
                required
                class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label for="admin-password" class="block text-xs font-medium text-slate-700">
                รหัสผ่าน
              </label>
              <input
                id="admin-password"
                bind:value={password}
                type="password"
                placeholder="Password"
                required
                class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              class="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
            >
              {#if loginLoading}
                กำลังเข้าสู่ระบบ...
              {:else}
                เข้าสู่ระบบด้วยรหัสผ่าน
              {/if}
            </button>
          </form>
        </div>
      </div>
    {:else}
      <!-- Top Title & Quick Actions -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            จัดการระบบ Hub
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            เพิ่ม แก้ไข และลบข้อมูลบริการและ Passion Group
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            onclick={refreshAll}
            title="รีเฟรชข้อมูล"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={13} class="{loadingGroups || loadingServices ? 'animate-spin' : ''}" />
            รีเฟรช
          </button>

          <!-- Easy Access Add Passion Group Button in Brand Orange -->
          <button
            onclick={() => {
              activeTab = 'passion-group';
              showAddGroupModal = true;
            }}
            class="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus size={15} />
            <span>เพิ่ม Passion Group</span>
          </button>
        </div>
      </div>

      <!-- Overview Cards in Brand Orange style -->
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer shadow-sm transition hover:border-orange-300"
          onclick={() => (activeTab = 'passion-group')}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter') activeTab = 'passion-group'; }}
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Community
            </span>
            <Users size={18} class="text-slate-400" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Passion Groups</h2>
              <p class="mt-1 text-2xl font-bold text-slate-900">{passionGroups.length} <span class="text-xs font-normal text-slate-400">กลุ่ม</span></p>
            </div>
            <button
              onclick={(e) => {
                e.stopPropagation();
                activeTab = 'passion-group';
                showAddGroupModal = true;
              }}
              class="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100"
            >
              + เพิ่มกลุ่ม
            </button>
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer shadow-sm transition hover:border-orange-300"
          onclick={() => (activeTab = 'services')}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter') activeTab = 'services'; }}
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Services
            </span>
            <Layers size={18} class="text-slate-400" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">บริการในระบบ</h2>
              <p class="mt-1 text-2xl font-bold text-slate-900">{services.length} <span class="text-xs font-normal text-slate-400">บริการ</span></p>
            </div>
            <button
              onclick={(e) => {
                e.stopPropagation();
                activeTab = 'services';
                showAddServiceModal = true;
              }}
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              + เพิ่มบริการ
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-6 flex border-b border-slate-200">
        <button
          onclick={() => (activeTab = 'passion-group')}
          class="relative pb-3 text-sm font-semibold transition mr-6 {activeTab === 'passion-group'
            ? 'text-orange-600 border-b-2 border-orange-500'
            : 'text-slate-500 hover:text-slate-800'}"
        >
          Passion Groups ({passionGroups.length})
        </button>
        <button
          onclick={() => (activeTab = 'services')}
          class="relative pb-3 text-sm font-semibold transition {activeTab === 'services'
            ? 'text-orange-600 border-b-2 border-orange-500'
            : 'text-slate-500 hover:text-slate-800'}"
        >
          Services ({services.length})
        </button>
      </div>

      <!-- TAB: PASSION GROUPS -->
      {#if activeTab === 'passion-group'}
        <div>
          <!-- Search Bar -->
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative w-full max-w-xs">
              <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                bind:value={searchGroup}
                type="text"
                placeholder="ค้นหากลุ่ม, ผู้ดูแล..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              onclick={() => (showAddGroupModal = true)}
              class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Plus size={14} />
              เพิ่ม Passion Group
            </button>
          </div>

          <!-- Groups List -->
          {#if loadingGroups}
            <div class="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <Loader2 class="size-5 animate-spin text-orange-500" />
            </div>
          {:else if filteredGroups.length === 0}
            <div class="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p class="text-sm text-slate-500">
                {searchGroup ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ยังไม่มี Passion Group ในระบบ'}
              </p>
              {#if !searchGroup}
                <button
                  onclick={() => (showAddGroupModal = true)}
                  class="mt-3 text-xs font-semibold text-orange-600 hover:underline"
                >
                  + เพิ่ม Passion Group กลุ่มแรก
                </button>
              {/if}
            </div>
          {:else}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {#each filteredGroups as group (group.id)}
                <div class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
                  <div>
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <h3 class="font-bold text-slate-900">
                          {group.name || group.title || 'Passion Group'}
                        </h3>
                        {#if group.owner_name}
                          <p class="mt-0.5 text-xs text-slate-500">
                            ผู้ดูแล: <span class="font-medium text-slate-700">{group.owner_name}</span>
                          </p>
                        {/if}
                      </div>

                      <button
                        onclick={() => handleDeleteGroup(group.id, group.name || group.title || 'กลุ่มนี้')}
                        title="ลบกลุ่ม"
                        class="text-slate-400 transition hover:text-red-600 p-1"
                        aria-label="ลบกลุ่ม"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p class="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {group.description || group.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </p>
                  </div>

                  <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    {#if group.url || group.link}
                      <a
                        href={group.url || group.link}
                        target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center gap-1 font-semibold text-orange-600 hover:underline"
                      >
                        เข้ากลุ่ม
                        <ArrowUpRight size={13} />
                      </a>
                    {:else}
                      <span class="text-slate-400">ไม่มีลิงก์</span>
                    {/if}

                    <span class="font-mono text-[10px] text-slate-300">
                      {group.id ? group.id.slice(0, 6) : ''}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- TAB: SERVICES -->
      {#if activeTab === 'services'}
        <div>
          <!-- Search & Filter Bar -->
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-1 flex-wrap items-center gap-2">
              <div class="relative w-full max-w-xs">
                <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  bind:value={searchService}
                  type="text"
                  placeholder="ค้นหาบริการ..."
                  class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div class="flex flex-wrap gap-1">
                {#each ['ทั้งหมด', 'Web app', 'Backend', 'Mobile', 'Infrastructure'] as typeOpt}
                  <button
                    onclick={() => (filterServiceType = typeOpt)}
                    class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition {filterServiceType ===
                    typeOpt
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500'}"
                  >
                    {typeOpt}
                  </button>
                {/each}
              </div>
            </div>

            <button
              onclick={() => (showAddServiceModal = true)}
              class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <Plus size={14} />
              เพิ่มบริการใหม่
            </button>
          </div>

          <!-- Services Grid -->
          {#if loadingServices}
            <div class="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <Loader2 class="size-5 animate-spin text-orange-500" />
            </div>
          {:else if filteredServices.length === 0}
            <div class="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p class="text-sm text-slate-500">ไม่พบบริการในระบบ</p>
              <button
                onclick={() => (showAddServiceModal = true)}
                class="mt-3 text-xs font-semibold text-orange-600 hover:underline"
              >
                + เพิ่มบริการใหม่
              </button>
            </div>
          {:else}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {#each filteredServices as service (service.id)}
                <div class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
                  <div>
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <h3 class="font-bold text-slate-900">{service.name}</h3>
                        <div class="mt-1 flex items-center gap-2">
                          <span class="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {service.type}
                          </span>
                          {#if service.status}
                            <span class="text-xs text-emerald-700">{service.status}</span>
                          {/if}
                        </div>
                      </div>

                      <button
                        onclick={() => handleDeleteService(service.id, service.name)}
                        title="ลบบริการ"
                        class="text-slate-400 transition hover:text-red-600 p-1"
                        aria-label="ลบบริการ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p class="mt-3 text-xs leading-relaxed text-slate-500">
                      {service.description || 'ไม่มีรายละเอียด'}
                    </p>
                  </div>

                  <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    {#if service.url}
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center gap-1 font-semibold text-orange-600 hover:underline"
                      >
                        เปิด URL
                        <ArrowUpRight size={13} />
                      </a>
                    {:else}
                      <span class="text-slate-400">ไม่มี URL</span>
                    {/if}

                    <span class="font-mono text-[10px] text-slate-300">
                      {service.id ? service.id.slice(0, 6) : ''}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </main>
</div>

<!-- ============================================== -->
<!-- MODAL: ADD PASSION GROUP                       -->
<!-- ============================================== -->
{#if showAddGroupModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-group-title"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 id="modal-group-title" class="text-base font-bold text-slate-900">
          เพิ่ม Passion Group
        </h2>
        <button
          onclick={() => (showAddGroupModal = false)}
          class="rounded p-1 text-slate-400 hover:text-slate-700"
          aria-label="ปิด Modal"
        >
          <X size={16} />
        </button>
      </div>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleAddGroup();
        }}
        class="mt-4 space-y-3.5"
      >
        <div>
          <label for="group-name" class="block text-xs font-semibold text-slate-700">
            ชื่อกลุ่ม <span class="text-orange-600">*</span>
          </label>
          <input
            id="group-name"
            bind:value={groupName}
            type="text"
            placeholder="เช่น AI Club, Game Dev"
            required
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label for="group-owner" class="block text-xs font-semibold text-slate-700">
            ชื่อผู้ดูแล
          </label>
          <input
            id="group-owner"
            bind:value={groupOwner}
            type="text"
            placeholder="เช่น Techasit"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label for="group-url" class="block text-xs font-semibold text-slate-700">
            ลิงก์กลุ่ม (Discord / LINE / FB)
          </label>
          <input
            id="group-url"
            bind:value={groupUrl}
            type="url"
            placeholder="https://..."
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label for="group-desc" class="block text-xs font-semibold text-slate-700">
            รายละเอียด
          </label>
          <textarea
            id="group-desc"
            bind:value={groupDescription}
            rows={3}
            placeholder="รายละเอียดกลุ่มสั้นๆ..."
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          ></textarea>
        </div>

        <div class="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onclick={() => (showAddGroupModal = false)}
            class="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submittingGroup}
            class="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
          >
            {#if submittingGroup}
              กำลังบันทึก...
            {:else}
              บันทึก Passion Group
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- ============================================== -->
<!-- MODAL: ADD SERVICE                             -->
<!-- ============================================== -->
{#if showAddServiceModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-service-title"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 id="modal-service-title" class="text-base font-bold text-slate-900">
          เพิ่มบริการใหม่
        </h2>
        <button
          onclick={() => (showAddServiceModal = false)}
          class="rounded p-1 text-slate-400 hover:text-slate-700"
          aria-label="ปิด Modal"
        >
          <X size={16} />
        </button>
      </div>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleAddService();
        }}
        class="mt-4 space-y-3.5"
      >
        <div>
          <label for="service-name" class="block text-xs font-semibold text-slate-700">
            ชื่อบริการ <span class="text-orange-600">*</span>
          </label>
          <input
            id="service-name"
            bind:value={serviceName}
            type="text"
            placeholder="ชื่อระบบ เช่น JupyterHub"
            required
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="service-type" class="block text-xs font-semibold text-slate-700">ประเภท</label>
            <select
              id="service-type"
              bind:value={serviceType}
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
            >
              <option>Web app</option>
              <option>Backend</option>
              <option>Mobile</option>
              <option>Infrastructure</option>
            </select>
          </div>

          <div>
            <label for="service-status" class="block text-xs font-semibold text-slate-700">สถานะ</label>
            <select
              id="service-status"
              bind:value={serviceStatus}
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
            >
              <option>พร้อมใช้งาน</option>
              <option>กำลังพัฒนา</option>
              <option>ปิดปรับปรุง</option>
            </select>
          </div>
        </div>

        <div>
          <label for="service-url" class="block text-xs font-semibold text-slate-700">
            URL ปลายทาง
          </label>
          <input
            id="service-url"
            bind:value={serviceUrl}
            type="url"
            placeholder="https://..."
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label for="service-desc" class="block text-xs font-semibold text-slate-700">
            รายละเอียด <span class="text-orange-600">*</span>
          </label>
          <textarea
            id="service-desc"
            bind:value={serviceDescription}
            rows={3}
            placeholder="รายละเอียดบริการ..."
            required
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          ></textarea>
        </div>

        <div class="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onclick={() => (showAddServiceModal = false)}
            class="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submittingService}
            class="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
          >
            {#if submittingService}
              กำลังบันทึก...
            {:else}
              บันทึกบริการ
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
