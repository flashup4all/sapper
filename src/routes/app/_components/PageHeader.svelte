<script>
export let title;
export let subtitle;
</script>
 {#if title}
<div class="app-page-title">
    <div class="page-title-wrapper">
        <div class="page-title-heading">
            <div class="page-title-icon">
                <i class="pe-7s-car icon-gradient bg-mean-fruit">
                </i>
            </div>
            <div>{title}
            {#if subtitle}
                <div class="page-title-subheading">{subtitle}</div>
            {/if}
            </div>
        </div>
    </div>
</div>
{/if}