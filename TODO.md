avoid reinit of the same song

add this filter to osc analysers (only if separate?):
      const filter = WAW.audioCtx.createBiquadFilter();
      filter.type = "lowshelf";
      filter.frequency.value = 120;
      filter.gain.value = -12;
      props.input.connect(filter);
      return filter;