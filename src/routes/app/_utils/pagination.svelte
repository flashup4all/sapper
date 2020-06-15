<script>
	import { onMount, createEventDispatcher } from 'svelte'

    export let current_page;
    export let last_page;
    let page_array = [];
   
    $: if(last_page > 1)
    {
        page_array = [...Array(last_page).keys()]
    }

    $: current_page;
    const dispatch = createEventDispatcher();
    onMount(() => {
        
    })
    function prev(i)
    {
        if(i > 1){
            current_page = i - 1
            handleClick(current_page)
        }
    }
    function handleClick(i){
        current_page = i;
        dispatch('message', {
			current_page
		});
    }
    function next(i)
    {
        if(i < last_page)
        {
            current_page = i + 1
            handleClick(current_page)
        }
    }
</script>
<style>

</style>


<div class="row justify-content-end mt-4">
<nav class="" aria-label="Page navigation example">
    <ul class="pagination">
        <li class="page-item" on:click={() => prev(current_page)}><a href="javascript:void(0);" class="page-link" aria-label="Previous"><span aria-hidden="true">«</span><span class="sr-only">Previous</span></a></li>
        
        {#each page_array as num, i}
        <li on:click={() => handleClick(i+1)} class="page-item {current_page === i+1 ? 'active' : ''}"><a href="javascript:void(0);" class="page-link">{ i+1 }</a></li>
        {/each}
        <li class="page-item" on:click={() => next(current_page)} ><a href="javascript:void(0);" class="page-link" aria-label="Next"><span aria-hidden="true">»</span><span class="sr-only">Next</span></a></li>
    </ul>
</nav>
</div>