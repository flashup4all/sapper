<!-- <script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main> -->
<script>
    import { goto } from '@sveltech/routify';
    import { onMount } from 'svelte'
    // import {get_token } from '../localstore';
    
	onMount( () => {
        
            // if(!get_token()){
    // $goto(window.location.href);
    // let path = "../auth";
                // $goto(path);
            // }
        
    })
    
</script>

<slot />