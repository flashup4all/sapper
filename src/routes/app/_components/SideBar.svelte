<script>
import { vendor_admin_guard, vendor_staff_guard, admin_guard, vendor_admin_staff_guard, admin_vendor_guard } from '../../../guards'
import { onMount } from 'svelte'
// import { goto, url } from "@sveltech/routify";

    // let vendor = {};
    // let user = {};
    onMount(() => {
        
    })

</script>
<div class="app-sidebar sidebar-shadow">
    <div class="app-header__logo">
        <div class="logo-src"></div>
        <div class="header__pane ml-auto">
            <div>
                <button type="button" class="hamburger close-sidebar-btn hamburger--elastic" data-class="closed-sidebar">
                    <span class="hamburger-box">
                        <span class="hamburger-inner"></span>
                    </span>
                </button>
            </div>
        </div>
    </div>
    <div class="app-header__mobile-menu">
        <div>
            <button type="button" class="hamburger hamburger--elastic mobile-toggle-nav">
                <span class="hamburger-box">
                    <span class="hamburger-inner"></span>
                </span>
            </button>
        </div>
    </div>
    <div class="app-header__menu">
        <span>
            <button type="button" class="btn-icon btn-icon-only btn btn-primary btn-sm mobile-toggle-header-nav">
                <span class="btn-icon-wrapper">
                    <i class="fa fa-ellipsis-v fa-w-6"></i>
                </span>
            </button>
        </span>
    </div>    <div class="scrollbar-sidebar">
        <div class="app-sidebar__inner">
            <ul class="vertical-nav-menu">
                <li class="app-sidebar__heading">Dashboards</li>
                <li>
                    <a href="/app" class="mm-active">
                        <i class="metismenu-icon pe-7s-rocket"></i>
                        Dashboard
                    </a>
                </li>
                <li class="app-sidebar__heading">Manage</li>                
                <li>
                <!-- svelte-ignore a11y-missing-attribute -->
                    <a href={`#`}>
                        <i class="metismenu-icon pe-7s-diamond"></i>
                        Activity
                        <i class="metismenu-state-icon pe-7s-angle-down caret-left"></i>
                    </a>
                    <ul >
                        <li>
                            <a href={'/app/orders'}>
                                <i class="metismenu-icon">
                                </i>Manage Orders
                            </a>
                        </li>
                        <li>
                            <a href={'/app/order-items'}>
                                <i class="metismenu-icon">
                                </i>Order Items
                            </a>
                        </li>
                        
                    </ul>
                </li>
                <li>
                <!-- svelte-ignore a11y-missing-attribute -->
                    <a href={`#`}>
                        <i class="metismenu-icon pe-7s-diamond"></i>
                        Settings
                        <i class="metismenu-state-icon pe-7s-angle-down caret-left"></i>
                    </a>
                    <ul >
                        <li>
                            <a href={'/app/orders'}>
                                <i class="metismenu-icon">
                                </i>Manage Orders
                            </a>
                        </li>
                        <li>
                            <a href={'/app/order-items'}>
                                <i class="metismenu-icon">
                                </i>Order Items
                            </a>
                        </li>
                        
                    </ul>
                </li>
                {#if admin_guard()}
                <li>
                <!-- svelte-ignore a11y-missing-attribute -->
                    <a href={`#`}>
                        <i class="metismenu-icon pe-7s-diamond"></i>
                        Reports
                        <i class="metismenu-state-icon pe-7s-angle-down caret-left"></i>
                    </a>
                    <ul >
                    
                        <li>
                            <a href={'/app/report/order'}>
                                <i class="metismenu-icon">
                                </i>Orders
                            </a>
                        </li>
                        
                    </ul>
                </li>
                 {/if}
                <li>
                    <a href={`#`}>
                        <i class="metismenu-icon pe-7s-diamond"></i>
                        Settings
                        <i class="metismenu-state-icon pe-7s-angle-down caret-left"></i>
                    </a>
                    <ul>
                    {#if admin_vendor_guard()}
                        <li>
                            <a href={'/app/product-items'}>
                                <i class="metismenu-icon">
                                </i>Product Items
                            </a>
                        </li>
                        <li>
                            <a href={'/app/product-category'}>
                                <i class="metismenu-icon">
                                </i>Product Category
                            </a>
                        </li>
                    {/if}
                    {#if admin_guard()}
                        <li>
                            <a href={'/app/vendors'}>
                                <i class="metismenu-icon">
                                </i>Vendors
                            </a>
                        </li>
                    {/if}
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div> 