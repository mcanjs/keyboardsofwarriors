const sleep = () =>
  new Promise((resolve) => {
    const rs: any = resolve;
    setTimeout(() => {
      rs();
    }, 350);
  });
